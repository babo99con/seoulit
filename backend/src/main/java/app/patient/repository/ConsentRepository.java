package app.patient.repository;

import app.patient.entity.ConsentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsentRepository extends JpaRepository<ConsentEntity, Long> {
    List<ConsentEntity> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    Optional<ConsentEntity> findByConsentIdAndPatientId(Long consentId, Long patientId);
    boolean existsByConsentIdAndPatientId(Long consentId, Long patientId);
}

