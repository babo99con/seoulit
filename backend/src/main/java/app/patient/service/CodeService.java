package app.patient.service;

import app.patient.dto.CodeRes;

import java.util.List;

public interface CodeService {

    List<CodeRes> findByGroup(String groupCode);
}

