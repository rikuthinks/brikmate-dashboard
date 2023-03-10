# Brikmate Dashboard Application

Showcasing the ingestion API endpoint and upload functionality for the Brikmate dashboard.

1. PDF or TXT files uploaded to dropzone are split into chunks then converted to OpenAI embeddings, which are uploaded to the Pinecone DB.

2. Pinecone embeddings are queried for each of the desired abstracted metrics (e.g. property address, tenant info, etc.).

3. The results are then displayed in the UI.

Warning: Ingestion will not work once the OpenAI API usage has hit its limit.

## Development

```
npm install
```

Start dev

```
npm run dev
```

## Credit:

- [ui](https://github.com/shadcn/ui): Beautifully designed components built with Radix UI and Tailwind CSS.
- [langchainjs](https://hwchase17.github.io/langchainjs/docs/overview/)
