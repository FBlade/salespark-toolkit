/******************************************************
 * ##: SMS Length Calculator
 * Calculates SMS length, segmentation, and encoding based on GSM rules.
 * Reference: 3GPP TS 23.038 (GSM 03.38)
 * History:
 * 14-03-2026: Created
 ****************************************************/

export type SmsEncoding = "GSM_7BIT" | "GSM_7BIT_EXT" | "UTF16";

export const GSM_7BIT_REGEXP =
  /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà]*$/;

export const GSM_7BIT_EXT_REGEXP =
  /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà\^{}\\\[\]~|€]*$/;

/******************************************************
 * Extended GSM characters that consume 2 septets each.
 * Per 3GPP TS 23.038 Table 3 (Basic Character Set Extension):
 * ^ { } \ [ ] ~ | €
 ****************************************************/
export const GSM_7BIT_EXT_CHAR_REGEXP = /[\^{}\\\[\]~|€]/g;

const messageLength: { [key in SmsEncoding]: number } = {
  GSM_7BIT: 160,
  GSM_7BIT_EXT: 160,
  UTF16: 70,
};

const multiMessageLength: { [key in SmsEncoding]: number } = {
  GSM_7BIT: 153,
  GSM_7BIT_EXT: 153,
  UTF16: 67,
};

export type SmsLengthResult = {
  encoding: SmsEncoding;
  length: number;
  characterPerMessage: number;
  inCurrentMessage: number;
  remaining: number;
  messages: number;
};

/******************************************************
 * ##: Detect Encoding
 * Determines the GSM encoding required for a given text.
 * Falls back to UTF-16 when characters outside GSM 03.38 are found.
 * @param {string} text - SMS message text
 ****************************************************/
const detectEncoding = (text: string): SmsEncoding => {
  if (GSM_7BIT_REGEXP.test(text)) {
    return "GSM_7BIT";
  }

  if (GSM_7BIT_EXT_REGEXP.test(text)) {
    return "GSM_7BIT_EXT";
  }

  return "UTF16";
};

/******************************************************
 * ##: SMS Length
 * Calculates encoding, length, and segmentation for an SMS message.
 * Extended GSM characters (^{}\\[]~|€) each count as 2 septets.
 * Supports optional per-encoding length overrides for carrier-specific limits.
 * @param {string} text - SMS message text
 * @param {Partial<Record<SmsEncoding, number>>} [singleOverrides] - Override
 *   single-segment lengths per encoding
 * @param {Partial<Record<SmsEncoding, number>>} [multiOverrides] - Override
 *   multi-segment lengths per encoding
 * History:
 * 14-03-2026: Created
 ****************************************************/
export const smsLength = (
  text: string,
  singleOverrides?: Partial<Record<SmsEncoding, number>>,
  multiOverrides?: Partial<Record<SmsEncoding, number>>,
): SmsLengthResult => {
  const singleLengths = { ...messageLength, ...singleOverrides };
  const multiLengths = { ...multiMessageLength, ...multiOverrides };

  // Early return for empty input — remaining equals a full single segment
  if (text.length === 0) {
    return {
      encoding: "GSM_7BIT",
      length: 0,
      characterPerMessage: singleLengths.GSM_7BIT,
      inCurrentMessage: 0,
      remaining: singleLengths.GSM_7BIT,
      messages: 0,
    };
  }

  const encoding = detectEncoding(text);

  // Extended chars each occupy 2 septets; run the regex once and reuse count
  const extCharCount =
    encoding === "GSM_7BIT_EXT"
      ? (text.match(GSM_7BIT_EXT_CHAR_REGEXP) ?? []).length
      : 0;

  const length = text.length + extCharCount;

  let characterPerMessage = singleLengths[encoding];
  if (length > characterPerMessage) {
    characterPerMessage = multiLengths[encoding];
  }

  const messages = Math.ceil(length / characterPerMessage);
  const inCurrentMessage = length - characterPerMessage * (messages - 1);

  // When length fills a segment exactly, remaining is 0; no special case needed
  const remaining = characterPerMessage * messages - length;

  return {
    encoding,
    length,
    characterPerMessage,
    inCurrentMessage,
    remaining,
    messages,
  };
};
