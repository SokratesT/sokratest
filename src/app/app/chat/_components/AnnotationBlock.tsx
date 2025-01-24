import type { JSONValue } from "ai";

interface BaseAnnotation {
  type: string;
}

interface AnnotationReference extends BaseAnnotation {
  name: string;
  similarity: number;
  text: string;
  fileId: string;
  type: "reference";
}

const AnnotationBlock = ({
  annotations,
}: { annotations: JSONValue[] | undefined }) => {
  return (
    <div>
      {annotations?.map((annotation) => {
        // FIXME: Bit awkward. Check if there's a better way to do this.
        const typedAnnotation = annotation as unknown as BaseAnnotation;

        switch (typedAnnotation.type) {
          case "reference": {
            const referenceAnnotation = typedAnnotation as AnnotationReference;
            return (
              // TODO: Probably should introduce an annotationId
              <div key={referenceAnnotation.fileId}>
                <p>File: {referenceAnnotation.fileId}</p>
                <p>Similarity: {referenceAnnotation.similarity}</p>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

export { AnnotationBlock };
