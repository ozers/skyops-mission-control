import { MissionRepository } from './ports/mission.repository';
import { ListMissionsUseCase } from './list-missions.use-case';

describe('ListMissionsUseCase', () => {
  const repo = (): jest.Mocked<MissionRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByIdForUpdate: jest.fn(),
    list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  });

  it('applies pagination defaults when no filters are given', async () => {
    const missions = repo();
    const page = await new ListMissionsUseCase(missions).execute({});

    expect(missions.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(page).toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
  });

  it('forwards every supplied filter', async () => {
    const missions = repo();
    const from = new Date('2026-01-01T00:00:00Z');
    const to = new Date('2026-02-01T00:00:00Z');

    await new ListMissionsUseCase(missions).execute({
      page: 3,
      pageSize: 10,
      status: 'PLANNED',
      droneId: 'd1',
      from,
      to,
    });

    expect(missions.list).toHaveBeenCalledWith({
      page: 3,
      pageSize: 10,
      status: 'PLANNED',
      droneId: 'd1',
      from,
      to,
    });
  });
});
