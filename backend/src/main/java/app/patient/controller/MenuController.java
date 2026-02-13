package app.patient.controller;


import app.patient.dto.MenuTreeRes;
import app.patient.service.MenuService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor

public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public List<MenuTreeRes> getMenus() {
        return menuService.getMenus();
    }
}

