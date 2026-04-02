package com.marketaisuite.marketai.repository;

import com.marketaisuite.marketai.domain.ChatMessage;
import com.marketaisuite.marketai.domain.GenerationActivity;
import com.marketaisuite.marketai.domain.SocialAccounts;
import com.marketaisuite.marketai.domain.UserRow;
import com.marketaisuite.marketai.domain.UserStats;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.sql.DataSource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;

    public DatabaseService(DataSource dataSource) {
        this.jdbc = new JdbcTemplate(dataSource);
        this.namedJdbc = new NamedParameterJdbcTemplate(dataSource);
    }

    public void initSchema() {
        jdbc.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE IF NOT EXISTS generations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE IF NOT EXISTS social_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    instagram_username TEXT,
                    twitter_username TEXT,
                    linkedin_username TEXT,
                    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE IF NOT EXISTS chats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    role TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """);
    }

    @Nullable
    public Long createUser(String name, String email, String passwordHash) {
        try {
            jdbc.update(
                    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                    name,
                    email,
                    passwordHash);
            Long id = jdbc.queryForObject("SELECT last_insert_rowid()", Long.class);
            return id;
        } catch (DataIntegrityViolationException e) {
            return null;
        }
    }

    public Optional<UserRow> getUserByEmail(String email) {
        List<Map<String, Object>> rows =
                jdbc.queryForList("SELECT * FROM users WHERE email = ?", email);
        if (rows.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(mapUserRow(rows.get(0)));
    }

    public Optional<UserRow> getUserById(long userId) {
        List<Map<String, Object>> rows =
                jdbc.queryForList("SELECT * FROM users WHERE id = ?", userId);
        if (rows.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(mapUserRow(rows.get(0)));
    }

    private static UserRow mapUserRow(Map<String, Object> row) {
        return new UserRow(
                ((Number) row.get("id")).longValue(),
                str(row.get("name")),
                str(row.get("email")),
                str(row.get("password_hash")));
    }

    public void logGeneration(long userId, String type, String content) {
        String truncated = content.length() > 500 ? content.substring(0, 500) : content;
        jdbc.update(
                "INSERT INTO generations (user_id, type, content) VALUES (?, ?, ?)",
                userId,
                type,
                truncated);
    }

    public UserStats getUserStats(long userId) {
        Integer total =
                jdbc.queryForObject(
                        "SELECT COUNT(*) FROM generations WHERE user_id = ?", Integer.class, userId);
        Integer campaigns =
                jdbc.queryForObject(
                        "SELECT COUNT(*) FROM generations WHERE user_id = ? AND type = ?",
                        Integer.class,
                        userId,
                        "campaign");
        Integer pitches =
                jdbc.queryForObject(
                        "SELECT COUNT(*) FROM generations WHERE user_id = ? AND type = ?",
                        Integer.class,
                        userId,
                        "pitch");
        Integer leads =
                jdbc.queryForObject(
                        "SELECT COUNT(*) FROM generations WHERE user_id = ? AND type = ?",
                        Integer.class,
                        userId,
                        "lead");

        List<Map<String, Object>> activityRows =
                jdbc.queryForList(
                        """
                        SELECT type, created_at FROM generations
                        WHERE user_id = ?
                        ORDER BY created_at DESC
                        LIMIT 10
                        """,
                        userId);

        List<GenerationActivity> recent = new ArrayList<>();
        for (Map<String, Object> r : activityRows) {
            recent.add(GenerationActivity.fromRow(r));
        }

        return new UserStats(
                total != null ? total : 0,
                campaigns != null ? campaigns : 0,
                pitches != null ? pitches : 0,
                leads != null ? leads : 0,
                recent);
    }

    public void saveSocialAccounts(
            long userId, String instagram, String twitter, String linkedin) {
        List<Map<String, Object>> existing =
                jdbc.queryForList("SELECT id FROM social_accounts WHERE user_id = ?", userId);
        if (existing.isEmpty()) {
            jdbc.update(
                    """
                    INSERT INTO social_accounts (user_id, instagram_username, twitter_username, linkedin_username)
                    VALUES (?, ?, ?, ?)
                    """,
                    userId,
                    nullToBlank(instagram),
                    nullToBlank(twitter),
                    nullToBlank(linkedin));
        } else {
            jdbc.update(
                    """
                    UPDATE social_accounts
                    SET instagram_username = ?, twitter_username = ?, linkedin_username = ?, connected_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                    """,
                    nullToBlank(instagram),
                    nullToBlank(twitter),
                    nullToBlank(linkedin),
                    userId);
        }
    }

    @Nullable
    public SocialAccounts getSocialAccounts(long userId) {
        List<Map<String, Object>> rows =
                jdbc.queryForList("SELECT * FROM social_accounts WHERE user_id = ?", userId);
        if (rows.isEmpty()) {
            return null;
        }
        return SocialAccounts.fromRow(rows.get(0));
    }

    /** JSON shape expected by existing frontend: snake_case keys including id fields when present. */
    public Map<String, Object> getSocialAccountsMap(long userId) {
        List<Map<String, Object>> rows =
                jdbc.queryForList("SELECT * FROM social_accounts WHERE user_id = ?", userId);
        if (rows.isEmpty()) {
            return null;
        }
        Map<String, Object> raw = rows.get(0);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", raw.get("id"));
        out.put("user_id", raw.get("user_id"));
        out.put("instagram_username", str(raw.get("instagram_username")));
        out.put("twitter_username", str(raw.get("twitter_username")));
        out.put("linkedin_username", str(raw.get("linkedin_username")));
        out.put("connected_at", raw.get("connected_at"));
        return out;
    }

    public void saveChatMessage(long userId, String role, String message) {
        jdbc.update(
                "INSERT INTO chats (user_id, role, message) VALUES (?, ?, ?)", userId, role, message);
    }

    public List<ChatMessage> getChatHistory(long userId, int limit) {
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("userId", userId);
        params.addValue("limit", limit);
        List<Map<String, Object>> rows =
                namedJdbc.queryForList(
                        """
                        SELECT role, message, timestamp FROM chats
                        WHERE user_id = :userId
                        ORDER BY timestamp DESC
                        LIMIT :limit
                        """,
                        params);
        List<ChatMessage> chats = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            chats.add(ChatMessage.fromRow(row));
        }
        Collections.reverse(chats);
        return chats;
    }

    private static String str(@Nullable Object o) {
        return o == null ? "" : o.toString();
    }

    private static String nullToBlank(@Nullable String s) {
        return s == null ? "" : s.trim();
    }
}
