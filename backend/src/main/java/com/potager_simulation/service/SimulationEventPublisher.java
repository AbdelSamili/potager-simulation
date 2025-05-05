package com.potager_simulation.service;

import com.potager_simulation.dto.EtatPotagerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class SimulationEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public SimulationEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publierEtatPotager(EtatPotagerDTO etat) {
        messagingTemplate.convertAndSend("/topic/potager-updates", etat);
    }
}