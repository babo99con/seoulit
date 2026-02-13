package app.patient.exception;

public class PatientStatusHistoryNotFoundException extends RuntimeException {
    public PatientStatusHistoryNotFoundException(Long id) {
        super("Status history not found. id=" + id);
    }
}
