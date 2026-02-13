package app.patient.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class MenuTreeRes {

    private Long id;
    private String code;
    private String name;
    private String path;
    private String icon;
    private Integer sortOrder;
    private List<MenuTreeRes> children = new ArrayList<>();
}

