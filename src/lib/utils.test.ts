import { cn } from './utils';

describe('cn function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', { 'conditional-class': true })).toBe(
      'base conditional-class'
    );
    expect(cn('base', { 'conditional-class': false })).toBe('base');
  });

  it('should merge Tailwind classes efficiently', () => {
    expect(cn('p-4 bg-red-500', 'p-6')).toBe('bg-red-500 p-6');
  });

  it('should handle array of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'valid')).toBe('base valid');
  });
});
