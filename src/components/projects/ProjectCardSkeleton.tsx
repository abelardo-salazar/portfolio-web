import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Skeleton,
} from "@abelardo-salazar/core-ui-design-system";

export const ProjectCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
};
