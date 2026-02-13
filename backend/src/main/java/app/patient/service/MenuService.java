package app.patient.service;

import app.patient.dto.MenuTreeRes;

import java.util.List;

public interface MenuService {

    List<MenuTreeRes> getMenus();
}

