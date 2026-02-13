package app.patient.exception;

public class PatientRestrictionNotFoundException extends RuntimeException {
    public PatientRestrictionNotFoundException(Long id) {
        super("Patient restriction not found. id=" + id);
    }
}

