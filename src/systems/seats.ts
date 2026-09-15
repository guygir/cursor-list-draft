export const ELECTORAL_THRESHOLD = 0.0325;
export const KNESSET_SEATS = 120;

export interface SeatInput {
  id: string;
  effectiveVotes: number;
}

export interface SeatRow {
  id: string;
  effectiveVotes: number;
  share: number;
  passedThreshold: boolean;
  seats: number;
}

export function allocateSeats(inputs: SeatInput[]): SeatRow[] {
  const total = inputs.reduce((sum, row) => sum + row.effectiveVotes, 0);
  const shares = inputs.map((row) => ({
    id: row.id,
    effectiveVotes: row.effectiveVotes,
    share: total > 0 ? row.effectiveVotes / total : 0,
    passedThreshold: total > 0 && row.effectiveVotes / total >= ELECTORAL_THRESHOLD,
    seats: 0,
  }));

  const eligible = shares.filter((row) => row.passedThreshold);
  if (eligible.length === 0) {
    return shares;
  }

  const seats = dhondt(
    eligible.map((row) => row.effectiveVotes),
    KNESSET_SEATS,
  );
  eligible.forEach((row, i) => {
    row.seats = seats[i] ?? 0;
  });
  return shares;
}

/** Simplified Bader–Ofer: D'Hondt / Hagenbach-Bischoff highest averages. */
export function dhondt(votes: number[], seatCount: number): number[] {
  const result = votes.map(() => 0);
  for (let s = 0; s < seatCount; s++) {
    let best = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < votes.length; i++) {
      const score = (votes[i] ?? 0) / ((result[i] ?? 0) + 1);
      if (score > bestScore + 1e-12 || (Math.abs(score - bestScore) <= 1e-12 && i < best)) {
        bestScore = score;
        best = i;
      }
    }
    result[best] = (result[best] ?? 0) + 1;
  }
  return result;
}
