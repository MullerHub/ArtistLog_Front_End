export interface AppNotification {
  id: string;
  type: "booking_request" | "booking_confirmed" | "review_received" | "message" | "system";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  entity_type?: "artist" | "venue" | "booking" | "review";
  entity_id?: string;
}
