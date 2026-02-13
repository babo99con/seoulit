package app.patient.exception;

public class InsuranceNotFoundException extends RuntimeException {
    public InsuranceNotFoundException(Long id) {
        super("보험 정보를 찾을 수 없습니다. id=" + id);
    }
}
