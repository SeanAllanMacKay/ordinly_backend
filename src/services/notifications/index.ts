/**
 * Multi-channel notification dispatch. A single fired trigger (a user reminder
 * or a system scan) fans out here to email / in-app / push, each delivered and
 * retried independently and recorded in NotificationDelivery.
 *
 *   import { dispatchNotification } from "../../services/notifications/index.js";
 */
export { dispatchNotification } from "./dispatch.js";
export type { DispatchProps, DispatchSource } from "./dispatch.js";
export type { NotificationContent } from "./channels/types.js";
