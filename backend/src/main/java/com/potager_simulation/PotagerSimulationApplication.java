package com.potager_simulation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Pour les tâches programmées de la simulation
public class PotagerSimulationApplication {
	public static void main(String[] args) {
		SpringApplication.run(PotagerSimulationApplication.class, args);
	}
}