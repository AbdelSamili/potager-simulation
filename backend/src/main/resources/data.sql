-- Suppression des données existantes
DELETE FROM programme;
DELETE FROM insecte;
DELETE FROM plante;
DELETE FROM dispositif_traitement;
DELETE FROM parcelle;

-- Création des parcelles (grille 5x5)
INSERT INTO parcelle (id, x, y, taux_humidite) VALUES
                                                   (1, 0, 0, 50.0), (2, 1, 0, 50.0), (3, 2, 0, 50.0), (4, 3, 0, 50.0), (5, 4, 0, 50.0),
                                                   (6, 0, 1, 50.0), (7, 1, 1, 50.0), (8, 2, 1, 50.0), (9, 3, 1, 50.0), (10, 4, 1, 50.0),
                                                   (11, 0, 2, 50.0), (12, 1, 2, 50.0), (13, 2, 2, 50.0), (14, 3, 2, 50.0), (15, 4, 2, 50.0),
                                                   (16, 0, 3, 50.0), (17, 1, 3, 50.0), (18, 2, 3, 50.0), (19, 3, 3, 50.0), (20, 4, 3, 50.0),
                                                   (21, 0, 4, 50.0), (22, 1, 4, 50.0), (23, 2, 4, 50.0), (24, 3, 4, 50.0), (25, 4, 4, 50.0);

-- Création des plantes
INSERT INTO plante (id, espece, age, age_maturite, est_drageonnante, probabilite_colonisation, parcelle_id) VALUES
                                                                                                                (1, 'Tomate', 5, 15, false, 0.0, 7),
                                                                                                                (2, 'Tomate', 3, 15, false, 0.0, 8),
                                                                                                                (3, 'Carotte', 8, 12, false, 0.0, 12),
                                                                                                                (4, 'Carotte', 10, 12, false, 0.0, 13),
                                                                                                                (5, 'Fraisier', 6, 10, true, 0.3, 17),
                                                                                                                (6, 'Fraisier', 9, 10, true, 0.3, 18),
                                                                                                                (7, 'Menthe', 8, 7, true, 0.5, 22),
                                                                                                                (8, 'Salade', 4, 8, false, 0.0, 3),
                                                                                                                (9, 'Salade', 6, 8, false, 0.0, 23),
                                                                                                                (10, 'Basilic', 5, 6, false, 0.0, 9);

-- Création des insectes
INSERT INTO insecte (id, espece, sexe, sante, mobilite, resistance_insecticide, pass_sans_manger, parcelle_id) VALUES
                                                                                                                   (1, 'Coccinelle', 'F', 9, 0.6, 0.7, 0, 2),
                                                                                                                   (2, 'Coccinelle', 'M', 8, 0.5, 0.6, 0, 2),
                                                                                                                   (3, 'Puceron', 'F', 7, 0.3, 0.2, 0, 8),
                                                                                                                   (4, 'Puceron', 'M', 7, 0.3, 0.2, 0, 13),
                                                                                                                   (5, 'Puceron', 'F', 8, 0.3, 0.2, 0, 13),
                                                                                                                   (6, 'Fourmi', 'F', 9, 0.7, 0.4, 0, 17),
                                                                                                                   (7, 'Fourmi', 'M', 8, 0.6, 0.4, 0, 17),
                                                                                                                   (8, 'Fourmi', 'F', 8, 0.6, 0.4, 0, 18),
                                                                                                                   (9, 'Abeille', 'F', 9, 0.8, 0.5, 0, 23),
                                                                                                                   (10, 'Abeille', 'M', 8, 0.7, 0.5, 0, 22),
                                                                                                                   (11, 'Chenille', 'F', 7, 0.2, 0.3, 0, 9),
                                                                                                                   (12, 'Chenille', 'M', 7, 0.2, 0.3, 0, 9);

-- Création des dispositifs de traitement
INSERT INTO dispositif_traitement (id, rayon, parcelle_id) VALUES
                                                               (1, 2, 13), -- Dispositif central
                                                               (2, 1, 1);  -- Dispositif coin supérieur gauche

-- Création des programmes d'activation
INSERT INTO programme (id, instant_debut, duree, type_traitement, dispositif_traitement_id) VALUES
                                                                                                (1, 10, 5, 'EAU', 1),        -- Programme d'arrosage pour le dispositif central
                                                                                                (2, 25, 3, 'INSECTICIDE', 1), -- Programme d'insecticide pour le dispositif central
                                                                                                (3, 45, 8, 'ENGRAIS', 1),     -- Programme d'engrais pour le dispositif central
                                                                                                (4, 15, 5, 'EAU', 2),        -- Programme d'arrosage pour le dispositif en coin
                                                                                                (5, 35, 4, 'ENGRAIS', 2);    -- Programme d'engrais pour le dispositif en coin