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
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.clerkId}>
              <TableCell>{user.firstName + " " + user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Delete User</DialogTitle>
                      <DialogDescription>
                        Do you really want to delete user account
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button onClick={() => handleDelete(user.clerkId)}>
                        Confirm
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
  );
}
