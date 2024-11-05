export interface TxRecord {
  id: number; // integer
  hash: string; // character varying(255)
  created_at: Date; // timestamp without time zone
  comment?: string; // character varying(328), nullable
  sender?: string; // character varying(66), nullable
  amount?: string; // character varying(32), nullable
  processed: boolean; // boolean
}
