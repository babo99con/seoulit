package app.patient.exception;

public class PatientFlagNotFoundException extends RuntimeException {
    public PatientFlagNotFoundException(Long id) {
        super("주의 플래그 정보를 찾을 수 없습니다. id=" + id);
    }
}
