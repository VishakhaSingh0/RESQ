
const { XMLParser } = require('fast-xml-parser');
const Alert = require('../models/Alert');

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
});

function text(value) {
  if (typeof value === 'string') return value;

  if (value && typeof value === 'object') {
    return value['#text'] || '';
  }

  return '';
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function clean(value) {
  return text(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function validDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function detectCategory(event, capCategory) {
  const value = `${event} ${capCategory}`.toLowerCase();

  if (/flood|inundation|waterlogging|बाढ़/.test(value)) {
    return 'Flood';
  }

  if (/fire|wildfire|forest fire/.test(value)) {
    return 'Fire';
  }

  if (/accident|road crash|collision/.test(value)) {
    return 'Accident';
  }

  if (/medical|health emergency/.test(value)) {
    return 'Medical emergency';
  }

  return 'Other';
}

function detectSeverity(value) {
  const severity = String(value || '').toLowerCase();

  if (['extreme', 'severe'].includes(severity)) {
    return 'High';
  }

  if (severity === 'moderate') {
    return 'Medium';
  }

  return 'Low';
}

function getReferencedAlertIds(cap) {
  const references = asArray(cap.references)
    .map(text)
    .filter(Boolean)
    .join(' ');

  if (!references) return [];

  return references
    .trim()
    .split(/\s+/)
    .map((reference) => reference.split(',')[1])
    .filter(Boolean);
}

function getAlertInfo(cap) {
  const infos = asArray(cap.info);

  return (
    infos.find((entry) =>
      text(entry.language).startsWith('en')
    ) || infos[0]
  );
}

async function fetchXml(url) {
  const parsedUrl = new URL(url);

  if (
    parsedUrl.protocol !== 'https:' ||
    parsedUrl.hostname !== 'sachet.ndma.gov.in'
  ) {
    throw new Error('Untrusted SACHET CAP URL');
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`CAP request failed: ${response.status}`);
  }

  return parser.parse(await response.text());
}

function buildAlertData(cap, info, link, itemTitle) {
  const event = clean(info.event);
  const headline = clean(info.headline) || clean(itemTitle);

  const locations = asArray(info.area)
    .map((area) => clean(area.areaDesc))
    .filter(Boolean);

  const description = [
    clean(info.description),
    clean(info.instruction),
  ].filter(Boolean).join(' ');

  const expiresAt = validDate(info.expires);

  return {
    title: headline || event || 'Official Disaster Alert',

    location: locations.join('; ') || 'Not specified',

    category: detectCategory(event, info.category),

    description,

    severity: detectSeverity(info.severity),

    status:
      expiresAt && expiresAt <= new Date()
        ? 'Resolved'
        : 'Active',

    alertType: 'Official',

    sourceName: text(cap.sender) || 'NDMA SACHET',

    sourceId: text(cap.identifier),

    sourceUrl: link,

    verificationStatus: 'Verified',

    affectedAreas: locations,

    issuedAt: validDate(cap.sent),

    expiresAt,
  };
}

async function processOfficialAlerts() {
  const feedUrl = process.env.SACHET_RSS_URL;

  if (!feedUrl) {
    throw new Error('SACHET_RSS_URL is not configured');
  }

  const parsedFeedUrl = new URL(feedUrl);

  if (
    parsedFeedUrl.protocol !== 'https:' ||
    parsedFeedUrl.hostname !== 'sachet.ndma.gov.in'
  ) {
    throw new Error('Untrusted SACHET RSS URL');
  }

  const feedResponse = await fetch(feedUrl, {
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'application/xml, text/xml',
    },
  });

  if (!feedResponse.ok) {
    throw new Error(`RSS request failed: ${feedResponse.status}`);
  }

  const feedXml = await feedResponse.text();
  const feed = parser.parse(feedXml);

  const items = asArray(feed?.rss?.channel?.item);

  const result = {
    fetched: items.length,
    inserted: 0,
    updated: 0,
    resolved: 0,
    standaloneUpdates: 0,
    skipped: 0,
    errors: 0,
    skippedReasons: {},
  };

  function skip(reason) {
    result.skipped++;

    result.skippedReasons[reason] =
      (result.skippedReasons[reason] || 0) + 1;
  }

  for (const item of items) {
    try {
      const link = text(item.link);
      const guid = text(item.guid);

      if (!link || !guid) {
        skip('missing_link_or_guid');
        continue;
      }

      const capDocument = await fetchXml(link);
      const cap = capDocument?.alert;

      if (!cap) {
        skip('missing_cap_document');
        continue;
      }

      if (cap.status !== 'Actual' || cap.scope !== 'Public') {
        skip('not_actual_or_not_public');
        continue;
      }

      const sourceId = text(cap.identifier) || guid;
      const referencedIds = getReferencedAlertIds(cap);

      // Find an existing official alert referenced by this message.
      const existingReferencedAlert =
        referencedIds.length > 0
          ? await Alert.findOne({
              sourceId: { $in: referencedIds },
              alertType: 'Official',
            })
          : null;

      // Handle official cancellation.
      if (cap.msgType === 'Cancel') {
        if (!existingReferencedAlert) {
          skip('cancel_parent_not_found');
          continue;
        }

        if (existingReferencedAlert.status === 'Resolved') {
          skip('already_cancelled');
          continue;
        }

        existingReferencedAlert.status = 'Resolved';
        existingReferencedAlert.expiresAt =
          validDate(cap.sent) || new Date();

        await existingReferencedAlert.save();

        resolvedCount();
        continue;
      }

      // Only process Alert and Update messages.
      if (!['Alert', 'Update'].includes(cap.msgType)) {
        skip('unsupported_message_type');
        continue;
      }

      const info = getAlertInfo(cap);

      if (!info) {
        skip('missing_info');
        continue;
      }

      const alertData = buildAlertData(
        cap,
        info,
        link,
        item.title
      );

      // Handle an official update.
      if (cap.msgType === 'Update' && existingReferencedAlert) {
        const duplicate = await Alert.findOne({
          sourceId,
          _id: { $ne: existingReferencedAlert._id },
        });

        if (duplicate) {
          skip('duplicate_update');
          continue;
        }

        Object.assign(existingReferencedAlert, alertData);

        await existingReferencedAlert.save();

        result.updated++;
        continue;
      }

      // Check whether this message already exists.
      const existing = await Alert.findOne({ sourceId });

      if (existing) {
        skip('duplicate_source_id');
        continue;
      }

      // Do not create an expired standalone warning.
      if (
        alertData.expiresAt &&
        alertData.expiresAt <= new Date()
      ) {
        skip('expired_alert');
        continue;
      }

      // An Update without its original message is saved
      // as a separate official record.
      await Alert.create(alertData);

      result.inserted++;

      if (cap.msgType === 'Update') {
        result.standaloneUpdates++;
      }
    } catch (error) {
      result.errors++;
      skip('processing_error');

      console.error('Official CAP processing error:', {
        message: error.message,
        url: text(item.link),
      });
    }
  }

  function resolvedCount() {
    result.resolved++;
  }

  return result;
}

let activeRefresh = null;

function fetchOfficialAlerts() {
  if (activeRefresh) {
    return activeRefresh;
  }

  activeRefresh = processOfficialAlerts()
    .finally(() => {
      activeRefresh = null;
    });

  return activeRefresh;
}

module.exports = {
  fetchOfficialAlerts,
};
