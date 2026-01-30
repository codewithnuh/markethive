"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "./admin-dashboard";
import { toast } from "@/hooks/use-toast";
import {
  DialogTitle,
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteClerkAccount } from "@/lib/actions/user/actions";

export function UsersList({ users }: { users: User[] }) {
  const handleDelete = async (id: string) => {
    try {
      const deletedUser = await deleteClerkAccount(id);

      if (deletedUser) {
        toast({
          title: "User Deleted",
          description: "User deleted successfully",
          variant: "default",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">Manage registered customers.</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-background/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent bg-secondary/30">
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4 px-6">Name</TableHead>
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Email</TableHead>
              <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4 text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.clerkId} className="border-b border-border/50 transition-colors hover:bg-secondary/10">
                <TableCell className="py-4 px-6 font-bold">
                  {user.firstName + " " + user.lastName}
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">{user.email}</TableCell>
                <TableCell className="py-4 text-right px-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 hover:text-red-600">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete {user.firstName}&apos;s account? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>

                      <DialogFooter>
                        <Button variant="destructive" onClick={() => handleDelete(user.clerkId)} className="rounded-full">
                          Confirm Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
