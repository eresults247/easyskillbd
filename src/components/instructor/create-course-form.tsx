"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCourseAction } from "@/server/actions/courses";
import { useToast } from "@/components/providers/toast-provider";

export function CreateCourseForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const course = await createCourseAction(formData);
        push("Course created! Now add modules & lessons.", "success");
        router.push(`/instructor/courses/${course.id}`);
      } catch {
        push("Failed to create course", "error");
      }
    });
  }

  return (
    <Card>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Course title</Label>
            <Input id="title" name="title" placeholder="e.g. Full-Stack Web Development Bootcamp" required />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" name="subtitle" placeholder="A short one-line pitch for your course" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={5} placeholder="What will students learn in this course?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="Web Development" defaultValue="Web Development" />
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select id="level" name="level" defaultValue="beginner">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
            <div>
              <Label htmlFor="discountPrice">Discount price (optional)</Label>
              <Input id="discountPrice" name="discountPrice" type="number" min="0" step="0.01" />
            </div>
          </div>
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail image URL</Label>
            <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="promoVideoUrl">Promo video URL (YouTube)</Label>
            <Input id="promoVideoUrl" name="promoVideoUrl" placeholder="https://youtube.com/watch?v=..." />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Creating..." : "Create course & continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
