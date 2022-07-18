declare module 'just-unique' {
  export default function unique<T>(arr: T[], sorted?: boolean | null, strings?: false | null): T[]
}
