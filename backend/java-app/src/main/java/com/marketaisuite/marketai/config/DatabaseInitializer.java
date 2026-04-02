package com.marketaisuite.marketai.config;

import com.marketaisuite.marketai.repository.DatabaseService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements ApplicationRunner {

    private final DatabaseService databaseService;

    public DatabaseInitializer(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @Override
    public void run(ApplicationArguments args) {
        databaseService.initSchema();
    }
}
