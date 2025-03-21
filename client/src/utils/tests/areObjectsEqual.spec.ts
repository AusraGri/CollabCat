import { describe, it, expect } from 'vitest'
import { areObjectsEqual } from '../helpers'

describe('areObjectsEqual', () => {
  it('should return true for two equal primitive values', () => {
    expect(areObjectsEqual(5, 5)).toBe(true)
    expect(areObjectsEqual('hello', 'hello')).toBe(true)
    expect(areObjectsEqual(true, true)).toBe(true)
    expect(areObjectsEqual(null, null)).toBe(true)
  })

  it('should return false for different primitive values', () => {
    expect(areObjectsEqual(5, '5')).toBe(false)
    expect(areObjectsEqual('hello', 'world')).toBe(false)
    expect(areObjectsEqual(true, false)).toBe(false)
    expect(areObjectsEqual(null, undefined)).toBe(false)
  })

  it('should return true for two equal objects', () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'John', age: 30 }
    expect(areObjectsEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for objects with different properties', () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'John', age: 31 }
    expect(areObjectsEqual(obj1, obj2)).toBe(false)
  })

  it('should return false for objects with different nested properties', () => {
    const obj1 = { user: { name: 'John', age: 30 } }
    const obj2 = { user: { name: 'John', age: 31 } }
    expect(areObjectsEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for objects with identical nested objects', () => {
    const obj1 = { user: { name: 'John', age: 30 } }
    const obj2 = { user: { name: 'John', age: 30 } }
    expect(areObjectsEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for objects with a different number of properties', () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'John' }
    expect(areObjectsEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for equal Date objects', () => {
    const date1 = new Date('2025-03-17T12:00:00Z')
    const date2 = new Date('2025-03-17T12:00:00Z')
    expect(areObjectsEqual(date1, date2)).toBe(true)
  })

  it('should return false for different Date objects', () => {
    const date1 = new Date('2025-03-17T12:00:00Z')
    const date2 = new Date('2025-03-18T12:00:00Z')
    expect(areObjectsEqual(date1, date2)).toBe(false)
  })

  it('should return false for objects with Date and non-Date values', () => {
    const obj1 = { startDate: new Date('2025-03-17T12:00:00Z') }
    const obj2 = { startDate: '2025-03-17T12:00:00Z' }
    expect(areObjectsEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for objects with empty objects', () => {
    const obj1 = {}
    const obj2 = {}
    expect(areObjectsEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for objects with different nested arrays', () => {
    const obj1 = { data: [1, 2, 3] }
    const obj2 = { data: [1, 2, 4] }
    expect(areObjectsEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for identical arrays within objects', () => {
    const obj1 = { data: [1, 2, 3] }
    const obj2 = { data: [1, 2, 3] }
    expect(areObjectsEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for arrays and objects of different lengths', () => {
    const obj1 = { data: [1, 2, 3] }
    const obj2 = { data: [1, 2] }
    expect(areObjectsEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for identical nested arrays and objects', () => {
    const obj1 = { data: { items: [1, 2, 3] } }
    const obj2 = { data: { items: [1, 2, 3] } }
    expect(areObjectsEqual(obj1, obj2)).toBe(true)
  })
})
