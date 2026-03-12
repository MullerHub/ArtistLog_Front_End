import { ApiError, apiClient } from "@/lib/api-client"
import { artistsService } from "@/lib/services/artists.service"

describe("artistsService.getAll", () => {
  const apiGetMock = jest.spyOn(apiClient, "get")

  beforeEach(() => {
    apiGetMock.mockReset()
  })

  it("sends tags with spaces correctly and returns normalized list shape", async () => {
    apiGetMock.mockResolvedValueOnce([
      {
        id: "artist-1",
        stage_name: "DJ Atlas",
        is_available: true,
        rating: 4.7,
        tags: ["Open Format"],
        created_at: "2026-03-11T10:00:00Z",
        updated_at: "2026-03-11T10:00:00Z",
      },
    ] as any)

    const response = await artistsService.getAll({
      tags: "Open Format",
      limit: 20,
      offset: 0,
    })

    expect(apiGetMock).toHaveBeenCalledWith("/artists", {
      tags: "Open Format",
      limit: 20,
      offset: 0,
    })

    expect(response.items).toHaveLength(1)
    expect(response.total).toBe(1)
    expect(response.items[0].stage_name).toBe("DJ Atlas")
  })

  it("retries without tag-like filters when backend rejects those query params", async () => {
    apiGetMock
      .mockRejectedValueOnce(
        new ApiError("invalid query params", 400, {
          message: "invalid query params",
        })
      )
      .mockResolvedValueOnce([
        {
          id: "artist-2",
          stage_name: "Banda Aurora",
          is_available: true,
          rating: 4.5,
          tags: ["Open Format", "House"],
          created_at: "2026-03-11T10:00:00Z",
          updated_at: "2026-03-11T10:00:00Z",
        },
      ] as any)

    const response = await artistsService.getAll({
      q: "dj",
      available: true,
      tags: "Open Format,House",
      genres: "House",
      event_types: "Open Format",
      limit: 20,
      offset: 0,
    })

    expect(apiGetMock).toHaveBeenNthCalledWith(1, "/artists", {
      q: "dj",
      available: true,
      tags: "Open Format,House",
      genres: "House",
      event_types: "Open Format",
      limit: 20,
      offset: 0,
    })

    expect(apiGetMock).toHaveBeenNthCalledWith(2, "/artists", {
      q: "dj",
      available: true,
      limit: 20,
      offset: 0,
    })

    expect(response.items).toHaveLength(1)
    expect(response.items[0].stage_name).toBe("Banda Aurora")
  })
})
