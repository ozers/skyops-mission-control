import { normalizePagination, paginate } from './pagination';

describe('normalizePagination', () => {
  it('defaults to page 1, pageSize 20', () => {
    expect(normalizePagination()).toEqual({ page: 1, pageSize: 20 });
  });

  it('clamps below-range values up to the minimum', () => {
    expect(normalizePagination({ page: 0, pageSize: 0 })).toEqual({ page: 1, pageSize: 1 });
  });

  it('clamps pageSize above the maximum', () => {
    expect(normalizePagination({ page: 3, pageSize: 500 })).toEqual({ page: 3, pageSize: 100 });
  });

  it('passes valid values through', () => {
    expect(normalizePagination({ page: 2, pageSize: 50 })).toEqual({ page: 2, pageSize: 50 });
  });
});

describe('paginate', () => {
  it('wraps items with pagination metadata', () => {
    expect(paginate(['a', 'b'], 42, { page: 2, pageSize: 2 })).toEqual({
      items: ['a', 'b'],
      total: 42,
      page: 2,
      pageSize: 2,
    });
  });
});
