import { Container, Skeleton } from "@abelardo-salazar/core-ui-design-system";
import { ProjectCardSkeleton } from "@/components/projects/ProjectCardSkeleton";

export default function LoadingProjects() {
  return (
    <Container size="lg" className="py-24">
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </Container>
  );
}
