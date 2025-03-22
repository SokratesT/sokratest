export type BucketName = (typeof buckets)[keyof typeof buckets]["name"];

export const buckets = {
  main: {
    name: "sokratest",
  },
};
