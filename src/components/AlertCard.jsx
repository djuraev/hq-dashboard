import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { Eye, Mail, ListTodo, ChevronRight, Send } from "lucide-react";
import { getBranch } from "../data/branches";
import { HealthBadge } from "./ui";
import Modal from "./Modal";
import { useToast } from "./Toast";

const SEV = {
  critical: { ring: "border-l-bad", chip: "bg-bad/10 text-bad", icon: "text-bad" },
  warning: { ring: "border-l-warn", chip: "bg-warn/10 text-warn", icon: "text-warn" },
};

export default function AlertCard({ alert }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);

  const s = SEV[alert.severity] ?? SEV.warning;
  const Icon = Icons[alert.icon] ?? Icons.AlertTriangle;
  const affected = (alert.branches ?? []).map(getBranch).filter(Boolean);

  function viewBranch() {
    if (affected.length === 1) navigate(`/branches/${affected[0].id}`);
    else setOpen((o) => !o);
  }

  return (
    <div className={`rounded-xl border border-ink-100 border-l-4 bg-white p-3.5 shadow-card ${s.ring}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${s.icon}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`pill ${s.chip} uppercase`}>{alert.severity}</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-ink-900">{alert.title}</div>
          <p className="mt-0.5 text-xs muted">{alert.detail}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Action icon={Eye} label="View Branch" primary onClick={viewBranch} />
            <Action icon={Mail} label="Contact" onClick={() => setContactOpen(true)} />
            <Action icon={ListTodo} label="Follow-up" onClick={() => setFollowOpen(true)} />
          </div>

          {open && affected.length > 0 && (
            <ul className="mt-2.5 space-y-1 rounded-lg border border-ink-100 bg-ink-50 p-1.5">
              {affected.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => navigate(`/branches/${b.id}`)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-white"
                  >
                    <span className="flex-1 truncate font-medium text-ink-800">{b.name}</span>
                    <span className="muted">{b.country}</span>
                    <HealthBadge band={b.band} score={b.healthScore} />
                    <ChevronRight size={14} className="text-ink-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        alert={alert}
        affected={affected}
        onSend={() => {
          setContactOpen(false);
          toast(`Email sent to ${affected.length || 1} branch manager(s).`);
        }}
      />
      <FollowupModal
        open={followOpen}
        onClose={() => setFollowOpen(false)}
        alert={alert}
        onCreate={() => {
          setFollowOpen(false);
          toast("Follow-up task created.");
        }}
      />
    </div>
  );
}

function Action({ icon: Icon, label, primary, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
        primary ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-ink-200 text-ink-700 hover:bg-ink-50"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function ContactModal({ open, onClose, alert, affected, onSend }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contact Branches"
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Cancel
          </button>
          <button onClick={onSend} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Send size={14} /> Send Email
          </button>
        </>
      }
    >
      <p className="text-xs muted">Re: {alert.title}</p>
      <div className="mt-3">
        <label className="text-xs font-medium text-ink-700">Recipients</label>
        <ul className="mt-1 space-y-1 rounded-lg border border-ink-100 p-2">
          {(affected.length ? affected : [{ id: "all", manager: "All affected managers", name: "—" }]).map((b) => (
            <li key={b.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-800">{b.manager}</span>
              <span className="muted">{b.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium text-ink-700">Message</label>
        <textarea
          rows={4}
          defaultValue={`Hello,\n\nWe noticed: ${alert.detail} Please review and respond with an action plan.\n\nThanks,\nEdulime HQ`}
          className="mt-1 w-full rounded-lg border border-ink-200 p-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </Modal>
  );
}

function FollowupModal({ open, onClose, alert, onCreate }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Follow-up"
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Cancel
          </button>
          <button onClick={onCreate} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
            Create Task
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Title">
          <input
            defaultValue={alert.title}
            className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Assignee">
            <select className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option>Regional Supervisor</option>
              <option>Operations Team</option>
              <option>Academic Director</option>
            </select>
          </Field>
          <Field label="Priority">
            <select
              defaultValue={alert.severity === "critical" ? "High" : "Medium"}
              className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Field>
        </div>
        <Field label="Due date">
          <input type="date" className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </Field>
        <Field label="Note">
          <textarea rows={3} placeholder="Add context…" className="w-full rounded-lg border border-ink-200 p-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </Field>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
