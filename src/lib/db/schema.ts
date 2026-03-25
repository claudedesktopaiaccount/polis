import { sqliteTable, text, integer, real, uniqueIndex, index, unique } from "drizzle-orm/sqlite-core";

// ─── Rate Limits ────────────────────────────────────────

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ipHash: text("ip_hash").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("rate_limits_ip_hash_idx").on(table.ipHash),
    index("rate_limits_created_at_idx").on(table.createdAt),
  ]
);

// ─── Parties ─────────────────────────────────────────────

export const parties = sqliteTable("parties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  color: text("color").notNull(),
  secondaryColor: text("secondary_color"),
  leader: text("leader").notNull(),
  ideology: text("ideology"),
  seats: integer("seats").default(0),
  logoUrl: text("logo_url"),
  portraitUrl: text("portrait_url"),
});

// ─── Polls ───────────────────────────────────────────────

export const polls = sqliteTable(
  "polls",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    agency: text("agency").notNull(),
    publishedDate: text("published_date").notNull(),
    fieldworkStart: text("fieldwork_start"),
    fieldworkEnd: text("fieldwork_end"),
    sampleSize: integer("sample_size"),
    sourceUrl: text("source_url"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("polls_agency_date_unique").on(table.agency, table.publishedDate),
  ]
);

export const pollResults = sqliteTable(
  "poll_results",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pollId: integer("poll_id")
      .notNull()
      .references(() => polls.id),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id),
    percentage: real("percentage").notNull(),
  },
  (table) => [
    index("poll_results_poll_id_idx").on(table.pollId),
    index("poll_results_party_id_idx").on(table.partyId),
  ]
);

// ─── Predictions ─────────────────────────────────────────

export const predictions = sqliteTable("predictions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  generatedAt: text("generated_at").notNull(),
  modelVersion: text("model_version").notNull(),
});

export const predictionResults = sqliteTable(
  "prediction_results",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    predictionId: integer("prediction_id")
      .notNull()
      .references(() => predictions.id),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id),
    predictedPct: real("predicted_pct").notNull(),
    lowerBound: real("lower_bound").notNull(),
    upperBound: real("upper_bound").notNull(),
    winProbability: real("win_probability").notNull(),
    parliamentProbability: real("parliament_probability").notNull(),
  },
  (table) => [
    index("pred_results_prediction_id_idx").on(table.predictionId),
  ]
);

// ─── News ────────────────────────────────────────────────

export const newsItems = sqliteTable(
  "news_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    source: text("source").notNull(),
    publishedAt: text("published_at"),
    scrapedAt: text("scraped_at").notNull(),
    category: text("category"),
  },
  (table) => [uniqueIndex("news_items_url_unique").on(table.url)]
);

// ─── Party Promises ──────────────────────────────────────

export const partyPromises = sqliteTable(
  "party_promises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id),
    promiseText: text("promise_text").notNull(),
    category: text("category").notNull(),
    isPro: integer("is_pro", { mode: "boolean" }).notNull(),
    sourceUrl: text("source_url"),
  },
  (table) => [index("party_promises_party_id_idx").on(table.partyId)]
);

// ─── Coalition Scenarios ─────────────────────────────────

export const coalitionScenarios = sqliteTable("coalition_scenarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  partyIds: text("party_ids").notNull(), // JSON array
  combinedProbability: real("combined_probability"),
  predictedSeats: integer("predicted_seats"),
  predictionId: integer("prediction_id").references(() => predictions.id),
});

// ─── Crowd Predictions (Tipovanie) ───────────────────────

export const userPredictions = sqliteTable(
  "user_predictions",
  {
    id: text("id").primaryKey(),
    visitorId: text("visitor_id").notNull(),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id),
    predictedPct: real("predicted_pct"),
    coalitionPick: text("coalition_pick"), // JSON array
    createdAt: text("created_at").notNull(),
    fingerprint: text("fingerprint"),
    userId: text("user_id").references(() => users.id),
  },
  (table) => [
    uniqueIndex("user_predictions_visitor_unique").on(table.visitorId),
    index("user_predictions_fingerprint_idx").on(table.fingerprint),
    index("user_predictions_user_id_idx").on(table.userId),
  ]
);

export const crowdAggregates = sqliteTable(
  "crowd_aggregates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id),
    totalBets: integer("total_bets").notNull().default(0),
    avgPredictedPct: real("avg_predicted_pct"),
    computedAt: text("computed_at").notNull(),
  },
  (table) => [
    uniqueIndex("crowd_aggregates_party_id_unique").on(table.partyId),
  ]
);

// ─── GDPR Audit Log ────────────────────────────────────

export const gdprAuditLog = sqliteTable(
  "gdpr_audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    action: text("action").notNull(), // 'delete' | 'export'
    visitorIdHash: text("visitor_id_hash").notNull(),
    timestamp: text("timestamp").notNull(),
    recordsAffected: integer("records_affected").notNull().default(0),
  },
  (table) => [
    index("gdpr_audit_log_action_idx").on(table.action),
    index("gdpr_audit_log_timestamp_idx").on(table.timestamp),
  ]
);

// ─── Newsletter Subscribers ───────────────────────────────

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    createdAt: text("created_at").notNull(),
    confirmedAt: text("confirmed_at"),
    unsubscribedAt: text("unsubscribed_at"),
    source: text("source").default("web"), // 'web' | 'homepage' | 'footer'
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_unique").on(table.email),
  ]
);

// ─── Users ──────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull(),
  emailVerifiedAt: text("email_verified_at"),
  visitorId: text("visitor_id"), // link to legacy cookie-based identity
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email),
  index("users_visitor_id_idx").on(table.visitorId),
]);

// ─── User Sessions ──────────────────────────────────────

export const userSessions = sqliteTable("user_sessions", {
  id: text("id").primaryKey(), // session token (UUID)
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
}, (table) => [
  index("user_sessions_user_idx").on(table.userId),
  index("user_sessions_expires_idx").on(table.expiresAt),
]);

// ─── Prediction Scores ─────────────────────────────────

export const predictionScores = sqliteTable("prediction_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id),
  visitorId: text("visitor_id"),
  electionId: text("election_id").notNull(), // e.g., "sr-2027"
  winnerScore: real("winner_score"),
  percentageScore: real("percentage_score"),
  coalitionScore: real("coalition_score"),
  totalScore: real("total_score").notNull().default(0),
  scoredAt: text("scored_at").notNull(),
}, (table) => [
  index("pred_scores_user_idx").on(table.userId),
  index("pred_scores_election_idx").on(table.electionId),
  index("pred_scores_total_idx").on(table.totalScore),
]);
