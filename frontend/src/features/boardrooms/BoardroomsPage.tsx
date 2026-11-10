import { useEffect, useState } from "react";
import {
  Building2,
  LoaderCircle,
  Pencil,
  Plus,
  Power,
  Users,
  X,
} from "lucide-react";

import {
  getAllBoardrooms,
  createBoardroom,
  updateBoardroom,
} from "./boardroom.service";
import type { Boardroom } from "./boardroom.types";

import Alert from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import IconButton from "../../components/ui/IconButton";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Textarea } from "../../components/ui/Textarea";

const BoardroomsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoardroom, setEditingBoardroom] = useState<Boardroom | null>(
    null,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState("");

  const [boardrooms, setBoardrooms] = useState<Boardroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoardrooms = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getAllBoardrooms();
        setBoardrooms(data);
      } catch (err) {
        console.error("Failed to load boardrooms:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load boardrooms.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBoardrooms();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCapacity("");
    setFacilities([]);
    setFacilityInput("");
    setFormError(null);
    setEditingBoardroom(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (boardroom: Boardroom) => {
    setEditingBoardroom(boardroom);
    setName(boardroom.name);
    setDescription(boardroom.description);
    setCapacity(String(boardroom.capacity));
    setFacilities([...boardroom.facilities]);
    setFacilityInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    resetForm();
  };

  const handleAddFacility = () => {
    const value = facilityInput.trim();

    if (!value) return;

    if (
      facilities.some(
        (facility) => facility.toLowerCase() === value.toLowerCase(),
      )
    ) {
      setFormError("This facility has already been added.");
      return;
    }

    setFacilities((prev) => [...prev, value]);
    setFacilityInput("");
    setFormError(null);
  };

  const handleRemoveFacility = (facilityToRemove: string) => {
    setFacilities((prev) =>
      prev.filter((facility) => facility !== facilityToRemove),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedCapacity = Number(capacity);

    if (!trimmedName) {
      setFormError("Boardroom name is required.");
      return;
    }

    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      setFormError("Capacity must be a positive whole number.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);

      if (editingBoardroom) {
        const updatedBoardroom = await updateBoardroom(editingBoardroom.id, {
          name: trimmedName,
          description: description.trim(),
          capacity: parsedCapacity,
          facilities,
        });

        setBoardrooms((prev) =>
          prev.map((boardroom) =>
            boardroom.id === updatedBoardroom.id ? updatedBoardroom : boardroom,
          ),
        );
      } else {
        const createdBoardroom = await createBoardroom({
          name: trimmedName,
          description: description.trim(),
          capacity: parsedCapacity,
          facilities,
        });

        setBoardrooms((prev) => [createdBoardroom, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save boardroom:", err);

      setFormError(
        err instanceof Error ? err.message : "Unable to save boardroom.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (boardroom: Boardroom) => {
    const nextStatus = boardroom.status === "active" ? "inactive" : "active";

    try {
      setUpdatingStatusId(boardroom.id);
      setError(null);

      const updatedBoardroom = await updateBoardroom(boardroom.id, {
        status: nextStatus,
      });

      setBoardrooms((prev) =>
        prev.map((item) =>
          item.id === updatedBoardroom.id ? updatedBoardroom : item,
        ),
      );
    } catch (err) {
      console.error("Failed to update boardroom status:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update boardroom status.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Boardrooms</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage workspace boardrooms, facilities and availability.
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus size={18} />
          Add Boardroom
        </Button>
      </div>

      {/* Listing */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner label="Loading boardrooms..." />
        </div>
      ) : error && boardrooms.length === 0 ? (
        <Alert variant="danger" title="Unable to load boardrooms">
          {error}
        </Alert>
      ) : boardrooms.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} />}
          title="No boardrooms yet"
          description="Create your first boardroom to get started."
          action={
            <Button onClick={handleOpenCreateModal}>
              <Plus size={18} />
              Add Boardroom
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {error && (
            <Alert variant="danger" title="Boardroom update failed">
              {error}
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Boardroom</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {boardrooms.map((boardroom) => (
                <TableRow key={boardroom.id}>
                  <TableCell className="min-w-55">
                    <div className="font-semibold text-text-primary">
                      {boardroom.name}
                    </div>
                    {boardroom.description && (
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-secondary">
                        {boardroom.description}
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Users size={16} className="text-text-secondary" />
                      <span className="font-medium">
                        {boardroom.capacity} seats
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-45">
                    {boardroom.facilities.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {boardroom.facilities.map((facility) => (
                          <Badge key={facility} variant="default">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary">
                        No facilities
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        boardroom.status === "active" ? "success" : "default"
                      }
                    >
                      {boardroom.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <IconButton
                        icon={<Pencil size={16} />}
                        label={`Edit ${boardroom.name}`}
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEditModal(boardroom)}
                      />

                      <IconButton
                        icon={
                          updatingStatusId === boardroom.id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Power size={16} />
                          )
                        }
                        label={
                          boardroom.status === "active"
                            ? `Deactivate ${boardroom.name}`
                            : `Activate ${boardroom.name}`
                        }
                        size="sm"
                        variant={
                          boardroom.status === "active" ? "danger" : "primary"
                        }
                        disabled={updatingStatusId !== null}
                        onClick={() => handleToggleStatus(boardroom)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Boardroom Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingBoardroom ? "Edit Boardroom" : "Add Boardroom"}
        description={
          editingBoardroom
            ? "Update the boardroom details and facilities."
            : "Set up a new meeting space in your workspace."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Boardroom Name"
            name="name"
            placeholder="e.g. Conference Room A"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Textarea
            label="Description"
            id="boardroom-description"
            name="description"
            placeholder="Describe the boardroom..."
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <Input
            label="Seating Capacity"
            name="capacity"
            type="number"
            min="1"
            step="1"
            placeholder="Enter seating capacity"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            required
          />

          {/* Facilities */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary">
              Facilities
            </label>

            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  name="facility"
                  placeholder="e.g. Projector, Whiteboard"
                  value={facilityInput}
                  onChange={(event) => setFacilityInput(event.target.value)}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddFacility}
                disabled={!facilityInput.trim()}
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => (
                  <div
                    key={facility}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1.5"
                  >
                    <span className="text-sm text-text-primary">
                      {facility}
                    </span>

                    <IconButton
                      icon={<X size={13} />}
                      label={`Remove ${facility}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFacility(facility)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && <Alert variant="danger">{formError}</Alert>}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button type="submit" loading={isSaving} disabled={isSaving}>
              {editingBoardroom ? "Save Changes" : "Create Boardroom"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BoardroomsPage;
