/**
 * Utility functions for sorting algorithms
 */

/**
 * Merge sort implementation (recursive)
 * @param arr Array to sort
 * @param compareFn Comparison function (a, b) => number
 * @returns Sorted array
 */
export function mergeSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);

  return merge(left, right, compareFn);
}

/**
 * Helper function to merge two sorted arrays
 */
function merge<T>(left: T[], right: T[], compareFn: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

/**
 * Comparison functions for courses
 */
export const courseComparators = {
  byRatingDesc: (a: any, b: any) => b.rating - a.rating,
  byRatingAsc: (a: any, b: any) => a.rating - b.rating,
  byPriceDesc: (a: any, b: any) => b.price - a.price,
  byPriceAsc: (a: any, b: any) => a.price - b.price,
  byStudentsDesc: (a: any, b: any) => b.students - a.students,
  byStudentsAsc: (a: any, b: any) => a.students - b.students,
};

/**
 * Comparison functions for instructors
 */
export const instructorComparators = {
  byRatingDesc: (a: any, b: any) => b.rating - a.rating,
  byRatingAsc: (a: any, b: any) => a.rating - b.rating,
  byStudentsDesc: (a: any, b: any) => b.students - a.students,
  byStudentsAsc: (a: any, b: any) => a.students - b.students,
  byCoursesDesc: (a: any, b: any) => b.courses - a.courses,
  byCoursesAsc: (a: any, b: any) => a.courses - b.courses,
};
