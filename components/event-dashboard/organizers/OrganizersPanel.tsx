"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import DataTable from "@/components/event-dashboard/shared/DataTable";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import EmptyState from "@/components/event-dashboard/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { removeCoOrganizer } from "@/lib/actions/gate.actions";
import type { EventOrganizersData } from "@/lib/event-dashboard/organizers";
import { AddCoOrganizerModal } from "@/components/profileCard";
import ViewerTimestampParts from "@/components/ViewerTimestampParts";

type TabId = "all" | "active" | "pending" | "declined";

type CommitteeRow = {
    clerkId: string;
    name: string;
    photo: string;
    status: "active" | "pending" | "declined";
    sinceValue: string;
    email?: string;
};

export default function OrganizersPanel({
    eventId,
    data,
    isCreator,
}: {
    eventId: string;
    data: EventOrganizersData;
    isCreator: boolean;
}) {
    const router = useRouter();
    const { user } = useUser();
    const [tab, setTab] = useState<TabId>("all");
    const [pending, startTransition] = useTransition();
    const [inviteOpen, setInviteOpen] = useState(false);

    function refresh() {
        router.refresh();
    }

    function handleRemove(targetClerkId: string) {
        startTransition(async () => {
            await removeCoOrganizer(eventId, targetClerkId);
            refresh();
        });
    }

    const allRows = useMemo<CommitteeRow[]>(() => [
        ...data.active.map((row) => ({
            clerkId: row.clerkId,
            name: row.name,
            photo: row.photo,
            email: row.email,
            status: "active" as const,
            sinceValue: row.addedAt,
        })),
        ...data.pending.map((row) => ({
            clerkId: row.clerkId,
            name: row.name,
            photo: row.photo,
            status: "pending" as const,
            sinceValue: row.invitedAt,
        })),
        ...data.denied.map((row) => ({
            clerkId: row.clerkId,
            name: row.name,
            photo: row.photo,
            status: "declined" as const,
            sinceValue: row.respondedAt ?? row.invitedAt,
        })),
    ], [data.active, data.pending, data.denied]);

    const [query, setQuery] = useState("");
    const filteredRows = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return allRows;
        return allRows.filter((row) =>
            [row.name, row.email ?? "", row.status].some((value) =>
                value.toLowerCase().includes(normalizedQuery)
            )
        );
    }, [allRows, query]);

    const filteredActive = useMemo(
        () => filteredRows.filter((row) => row.status === "active"),
        [filteredRows]
    );
    const filteredPending = useMemo(
        () => filteredRows.filter((row) => row.status === "pending"),
        [filteredRows]
    );
    const filteredDeclined = useMemo(
        () => filteredRows.filter((row) => row.status === "declined"),
        [filteredRows]
    );

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: "all", label: "All", count: allRows.length },
        { id: "active", label: "Active", count: data.active.length },
        { id: "pending", label: "Pending", count: data.pending.length },
        { id: "declined", label: "Declined", count: data.denied.length },
    ];

    return (
        <div className="space-y-6">
            <PageSection
                title="Team Members"
                description="Manage co-organizers and track invite status."
                titleClassName="whitespace-nowrap"
                descriptionClassName="hidden sm:block"
                headerClassName="flex-row items-center justify-between sm:items-start"
                action={
                    <>
                        {isCreator && (
                            <button
                                type="button"
                                onClick={() => setInviteOpen(true)}
                                className="inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-colors hover:bg-indigo-700 sm:hidden"
                            >
                                + Add co-organizer
                            </button>
                        )}
                        <div className="hidden flex-col items-end gap-5 sm:flex">
                            {isCreator && (
                                <button
                                    type="button"
                                    onClick={() => setInviteOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-colors hover:bg-indigo-700"
                                >
                                    + Add co-organizer
                                </button>
                            )}
                        </div>
                    </>
                }
            >
                <div className="space-y-6 sm:space-y-0">
                    <div className="mb-4 flex min-w-0 items-center gap-2 sm:gap-3">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by name or email…"
                            aria-label="Search organizers"
                            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                        <Tabs
                            value={tab}
                            onValueChange={(value) => setTab(value as TabId)}
                            className="min-w-0 flex-[2]"
                        >
                            <TabsList className="grid h-10 w-full grid-cols-4 items-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                                {tabs.map((item) => (
                                    <TabsTrigger
                                        key={item.id}
                                        value={item.id}
                                        className="h-8 min-w-0 rounded-md px-0.5 text-[8px] leading-none text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2 sm:text-[11px]"
                                    >
                                        {item.label} ({item.count})
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    {tab === "all" && (
                    <>
                        {allRows.length === 0 ? (
                            <EmptyState title="No co-organizers yet" description="Invite someone to help run this event." />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: "name",
                                        header: "Invitee",
                                        cell: (row: CommitteeRow) => (
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                                                    <Image
                                                        src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                                        alt={row.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] text-slate-800">{row.name}</p>
                                                    {row.email && <p className="text-[11px] text-slate-500">{row.email}</p>}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "status",
                                        header: "Status",
                                        cell: (row: CommitteeRow) =>
                                            row.status === "active" ? (
                                                <Badge variant="success">Active</Badge>
                                            ) : row.status === "pending" ? (
                                                <Badge variant="secondary">Pending</Badge>
                                            ) : (
                                                <Badge variant="destructive">Declined</Badge>
                                            ),
                                    },
                                    {
                                        key: "sinceDate",
                                        header: "Date",
                                        cell: (row: CommitteeRow) => (
                                            <ViewerTimestampParts value={row.sinceValue} part="date" className="text-[12px] text-slate-500" />
                                        ),
                                    },
                                    {
                                        key: "sinceTime",
                                        header: "Time",
                                        cell: (row: CommitteeRow) => (
                                            <ViewerTimestampParts value={row.sinceValue} part="time" className="text-[12px] text-slate-500" />
                                        ),
                                    },
                                ]}
                            rows={filteredRows}
                            emptyMessage="No organizers match your search."
                            />
                        )}
                    </>
                )}

                    {tab === "active" && (
                    <>
                        {data.active.length === 0 ? (
                            <EmptyState title="No co-organizers yet" description="Invite someone to help run this event." />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: "name",
                                        header: "Organizer",
                                        cell: (row) => (
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                                                    <Image
                                                        src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                                        alt={row.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] text-slate-800">{row.name}</p>
                                                    <p className="text-[11px] text-slate-500">{row.email}</p>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "addedDate",
                                        header: "Date",
                                        cell: (row) => (
                                            <ViewerTimestampParts value={row.sinceValue} part="date" className="text-[12px] text-slate-500" />
                                        ),
                                    },
                                    {
                                        key: "addedTime",
                                        header: "Time",
                                        cell: (row) => (
                                            <ViewerTimestampParts value={row.sinceValue} part="time" className="text-[12px] text-slate-500" />
                                        ),
                                    },
                                    ...(isCreator
                                        ? [
                                              {
                                                  key: "actions",
                                                  header: "",
                                                  cell: (row: CommitteeRow) => (
                                                      <button
                                                          type="button"
                                                          disabled={pending}
                                                          onClick={() => handleRemove(row.clerkId)}
                                                          className="text-[12px] text-red-400/80 hover:text-red-300"
                                                      >
                                                          Remove
                                                      </button>
                                                  ),
                                              },
                                          ]
                                        : []),
                                ]}
                                rows={filteredActive}
                                emptyMessage="No organizers match your search."
                            />
                        )}
                    </>
                )}

                    {tab === "pending" && (
                    <DataTable
                        columns={[
                            {
                                key: "name",
                                header: "Invitee",
                                cell: (row) => (
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                                            <Image
                                                src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                                alt={row.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-[13px] text-slate-800">{row.name}</span>
                                    </div>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                cell: () => <Badge variant="secondary">Pending</Badge>,
                            },
                            {
                                key: "invitedDate",
                                header: "Date",
                                cell: (row) => (
                                    <ViewerTimestampParts value={row.sinceValue} part="date" className="text-[12px] text-slate-500" />
                                ),
                            },
                            {
                                key: "invitedTime",
                                header: "Time",
                                cell: (row) => (
                                    <ViewerTimestampParts value={row.sinceValue} part="time" className="text-[12px] text-slate-500" />
                                ),
                            },
                        ]}
                        rows={filteredPending}
                        emptyMessage={query ? "No pending invites match your search." : "No pending invites."}
                    />
                )}

                    {tab === "declined" && (
                    <DataTable
                        columns={[
                            {
                                key: "name",
                                header: "Invitee",
                                cell: (row) => (
                                    <span className="text-[13px] text-slate-800">{row.name}</span>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                cell: () => <Badge variant="destructive">Declined</Badge>,
                            },
                            {
                                key: "respondedDate",
                                header: "Date",
                                cell: (row) => (
                                    <ViewerTimestampParts value={row.sinceValue} part="date" className="text-[12px] text-slate-500" />
                                ),
                            },
                            {
                                key: "respondedTime",
                                header: "Time",
                                cell: (row) => (
                                    <ViewerTimestampParts value={row.sinceValue} part="time" className="text-[12px] text-slate-500" />
                                ),
                            },
                        ]}
                        rows={filteredDeclined}
                        emptyMessage={query ? "No declined invites match your search." : "No declined invites."}
                    />
                    )}
                </div>
            </PageSection>
            <AddCoOrganizerModal
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                viewerClerkId={user?.id ?? ""}
                eventId={eventId}
                onChanged={refresh}
            />
        </div>
    );
}
