import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <>
      <Card className="border-0 overflow-hidden shadow-none bg-white dark:bg-[#273142]">
        <CardContent className="py-10 lg:py-[60px] xl:py-[80px] px-8 text-center">
          <h6 className="mb-4">User not Found</h6>
          <p className="text-secondary-light">
            Sorry, the user you are looking for doesn't exist{" "}
          </p>
          <Button variant="default" asChild className="mt-10">
            <Link href="/users" className="rounded-lg px-10 py-6">
              Back to Users
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
