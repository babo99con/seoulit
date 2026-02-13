package app.patient.exception;

public class ConsentNotFoundException extends RuntimeException {
    public ConsentNotFoundException(Long id) {
        super("동의서 정보를 찾을 수 없습니다. id=" + id);
    }
}
