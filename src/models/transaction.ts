// export interface Transaction {
//     id: number;
//     hash: string;
//     created_ad: Date;
//     comment: string;
// }

export interface Transaction {
  account: "string";
  account_state_after: {
    account_status: "string";
    balance: "string";
    code_boc: "string";
    code_hash: "string";
    data_boc: "string";
    data_hash: "string";
    frozen_hash: "string";
    hash: "string";
  };
  account_state_before: {
    account_status: "string";
    balance: "string";
    code_boc: "string";
    code_hash: "string";
    data_boc: "string";
    data_hash: "string";
    frozen_hash: "string";
    hash: "string";
  };
  block_ref: {
    seqno: 0;
    shard: "0";
    workchain: 0;
  };
  description: {
    aborted: true;
    action: {
      action_list_hash: "string";
      msgs_created: 0;
      no_funds: true;
      result_arg: 0;
      result_code: 0;
      skipped_actions: 0;
      spec_actions: 0;
      status_change: "string";
      success: true;
      tot_actions: 0;
      tot_msg_size: {
        bits: "0";
        cells: "0";
      };
      total_action_fees: "0";
      total_fwd_fees: "0";
      valid: true;
    };
    bounce: {
      fwd_fees: "0";
      msg_fees: "0";
      msg_size: {
        bits: "0";
        cells: "0";
      };
      req_fwd_fees: "0";
      type: "string";
    };
    compute_ph: {
      account_activated: true;
      exit_arg: 0;
      exit_code: 0;
      gas_credit: "0";
      gas_fees: "0";
      gas_limit: "0";
      gas_used: "0";
      mode: 0;
      msg_state_used: true;
      reason: "string";
      skipped: true;
      success: true;
      vm_final_state_hash: "string";
      vm_init_state_hash: "string";
      vm_steps: 0;
    };
    credit_first: true;
    credit_ph: {
      credit: "0";
      due_fees_collected: "0";
    };
    destroyed: true;
    installed: true;
    is_tock: true;
    split_info: {
      acc_split_depth: 0;
      cur_shard_pfx_len: 0;
      sibling_addr: "string";
      this_addr: "string";
    };
    storage_ph: {
      status_change: "string";
      storage_fees_collected: "0";
      storage_fees_due: "0";
    };
    type: "string";
  };
  end_status: "string";
  hash: "string";
  in_msg: {
    bounce: true;
    bounced: true;
    created_at: "0";
    created_lt: "0";
    destination: "string";
    fwd_fee: "0";
    hash: "string";
    ihr_disabled: true;
    ihr_fee: "0";
    import_fee: "0";
    init_state: {
      body: "string";
      decoded: {
        comment: "string";
        type: "string";
      };
      hash: "string";
    };
    message_content: {
      body: "string";
      decoded: {
        comment: "string";
        type: "string";
      };
      hash: "string";
    };
    opcode: 0;
    source: "string";
    value: "0";
  };
  lt: "0";
  mc_block_seqno: 0;
  now: 0;
  orig_status: "string";
  out_msgs: [
    {
      bounce: true;
      bounced: true;
      created_at: "0";
      created_lt: "0";
      destination: "string";
      fwd_fee: "0";
      hash: "string";
      ihr_disabled: true;
      ihr_fee: "0";
      import_fee: "0";
      init_state: {
        body: "string";
        decoded: {
          comment: "string";
          type: "string";
        };
        hash: "string";
      };
      message_content: {
        body: "string";
        decoded: {
          comment: "string";
          type: "string";
        };
        hash: "string";
      };
      opcode: 0;
      source: "string";
      value: "0";
    }
  ];
  prev_trans_hash: "string";
  prev_trans_lt: "0";
  total_fees: "0";
  trace_id: "string";
}
