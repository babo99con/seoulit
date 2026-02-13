package app.patient.exception;

public class PatientMemoNotFoundException extends RuntimeException {
    public PatientMemoNotFoundException(Long id) {
        super("Patient memo not found. id=" + id);
    }
}

