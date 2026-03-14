/******************************************************
 * ##: UUID v4 Generator (uuid wrapper)
 * Thin wrapper around the "uuid" package v4 generator.
 * History:
 * 14-03-2026: Created
 ****************************************************/

import { v4 as uuidv4 } from "uuid";

/******************************************************************
 * ##: Generate UUID v4
 * Generates a RFC 4122 version 4 UUID string.
 *
 * TL;DR: Calls uuid.v4() and returns the UUID string.
 * @returns {string} - RFC 4122 v4 UUID
 * History:
 * 14-03-2026: Created
 ******************************************************************/
export { uuidv4 };
