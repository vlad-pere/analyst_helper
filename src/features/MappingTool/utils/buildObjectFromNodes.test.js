// --- START OF FILE src/features/MappingTool/utils/buildObjectFromNodes.test.js ---

import { buildObjectFromNodes } from './buildObjectFromNodes';

describe('buildObjectFromNodes', () => {
  it('should return an empty object for empty inputs', () => {
    expect(buildObjectFromNodes([], new Map())).toEqual({});
    expect(buildObjectFromNodes(null, new Map())).toEqual({});
    expect(buildObjectFromNodes(['root-1'], null)).toEqual({});
  });

  it('should build a simple flat object', () => {
    const rootIds = ['node-1', 'node-2'];
    const nodesMap = new Map([
      ['node-1', { id: 'node-1', key: 'name', value: 'John', type: 'string', childrenIds: [] }],
      ['node-2', { id: 'node-2', key: 'age', value: 30, type: 'number', childrenIds: [] }],
    ]);
    const expected = { name: 'John', age: 30 };
    expect(buildObjectFromNodes(rootIds, nodesMap)).toEqual(expected);
  });

  it('should build a nested object', () => {
    const rootIds = ['node-1'];
    const nodesMap = new Map([
      ['node-1', { id: 'node-1', key: 'user', type: 'object', childrenIds: ['node-2'] }],
      ['node-2', { id: 'node-2', key: 'details', type: 'object', childrenIds: ['node-3'] }],
      ['node-3', { id: 'node-3', key: 'id', value: 123, type: 'number', childrenIds: [] }],
    ]);
    const expected = { user: { details: { id: 123 } } };
    expect(buildObjectFromNodes(rootIds, nodesMap)).toEqual(expected);
  });

  it('should build an array of objects', () => {
    const rootIds = ['node-1', 'node-2'];
    const nodesMap = new Map([
      ['node-1', { id: 'node-1', key: '0', type: 'object', childrenIds: ['node-1-1'] }],
      ['node-1-1', { id: 'node-1-1', key: 'item', value: 'A', type: 'string', childrenIds: [] }],
      ['node-2', { id: 'node-2', key: '1', type: 'object', childrenIds: ['node-2-1'] }],
      ['node-2-1', { id: 'node-2-1', key: 'item', value: 'B', type: 'string', childrenIds: [] }],
    ]);
    const expected = [{ item: 'A' }, { item: 'B' }];
    expect(buildObjectFromNodes(rootIds, nodesMap)).toEqual(expected);
  });

  it('should correctly handle different primitive types', () => {
    const rootIds = ['node-1', 'node-2', 'node-3', 'node-4'];
    const nodesMap = new Map([
      ['node-1', { id: 'node-1', key: 'isReady', value: 'true', type: 'boolean', childrenIds: [] }],
      ['node-2', { id: 'node-2', key: 'count', value: '100', type: 'number', childrenIds: [] }],
      ['node-3', { id: 'node-3', key: 'data', value: null, type: 'null', childrenIds: [] }],
      ['node-4', { id: 'node-4', key: 'description', value: 'Hello', type: 'string', childrenIds: [] }],
    ]);
    const expected = { isReady: true, count: 100, data: null, description: 'Hello' };
    expect(buildObjectFromNodes(rootIds, nodesMap)).toEqual(expected);
  });

  it('should unwrap a single primitive value from its container', () => {
    const rootIds = ['node-1'];
    const nodesMap = new Map([
      ['node-1', { id: 'node-1', key: 'value', value: 'just a string', type: 'string', childrenIds: [] }],
    ]);
    expect(buildObjectFromNodes(rootIds, nodesMap)).toBe('just a string');
  });
});