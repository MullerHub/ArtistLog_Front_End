import { resolveNotificationHref } from "@/lib/notification-routing"
import type { Notification } from "@/lib/services/notifications.service"

function makeNotification(overrides: Partial<Notification>): Notification {
  return {
    id: "notification-1",
    user_id: "user-1",
    type: "welcome",
    title: "Titulo",
    message: "Mensagem",
    is_read: false,
    created_at: "2026-03-10T12:00:00Z",
    updated_at: "2026-03-10T12:00:00Z",
    ...overrides,
  }
}

describe("resolveNotificationHref", () => {
  it("redirects community venue creation to the created venue detail", () => {
    const href = resolveNotificationHref(
      makeNotification({
        type: "community_venue_created",
        related_entity_id: "venue-123",
        related_entity_type: "community_venue",
      })
    )

    expect(href).toBe("/venues/venue-123")
  })

  it("prefers action_url when provided by backend", () => {
    const href = resolveNotificationHref(
      makeNotification({
        type: "contract_received",
        action_url: "/contracts?highlight=contract-1",
      })
    )

    expect(href).toBe("/contracts?highlight=contract-1")
  })

  it("falls back to metadata venue id when related entity is missing", () => {
    const href = resolveNotificationHref(
      makeNotification({
        type: "community_venue_claimed",
        metadata: {
          venue_id: "venue-999",
        },
      })
    )

    expect(href).toBe("/venues/venue-999")
  })

  it("routes review notifications to reviews workspace when no direct entity exists", () => {
    const href = resolveNotificationHref(
      makeNotification({
        type: "review_received",
      })
    )

    expect(href).toBe("/reviews")
  })
})
