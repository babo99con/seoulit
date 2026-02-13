package app.patient.entity;

import java.io.Serializable;
import java.util.Objects;

public class CodeId implements Serializable {

    private String groupCode;
    private String code;

    public CodeId() {
    }

    public CodeId(String groupCode, String code) {
        this.groupCode = groupCode;
        this.code = code;
    }

    public String getGroupCode() {
        return groupCode;
    }

    public void setGroupCode(String groupCode) {
        this.groupCode = groupCode;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CodeId codeId = (CodeId) o;
        return Objects.equals(groupCode, codeId.groupCode) &&
                Objects.equals(code, codeId.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupCode, code);
    }
}
