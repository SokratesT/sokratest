"use client";

import { addCourseMember } from "@/db/actions/course";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "@/db/schema/auth";
import type { Course } from "@/db/schema/course";
import { useBucketSearchParams } from "@/lib/nuqs/search-params.bucket";
import { UserIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";

const AddCourseMembers = ({
  availableUsers,
  courseId,
}: { availableUsers: User[]; courseId: Course["id"] }) => {
  const [, startTransition] = useTransition();
  const [, setQuery] = useBucketSearchParams(startTransition);

  const handleSearch = useDebounceCallback((search: string) => {
    setQuery({ search });
  }, 500);

  const [open, setOpen] = useState(false);

  const handleAddMember = (user: User) => {
    addCourseMember({ courseId, userId: user.id });
    setOpen(false);
    toast.success("Member added");
  };

  useEffect(() => {
    if (!open) {
      setQuery({ search: "" });
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[400px] justify-between"
        >
          Add User
          <UserIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={handleSearch}
            placeholder="Type a command or search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {availableUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  className="flex justify-between"
                  onSelect={() => handleAddMember(user)}
                >
                  <span>{user.name}</span>
                  <span className="text-muted-foreground">{user.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { AddCourseMembers };
