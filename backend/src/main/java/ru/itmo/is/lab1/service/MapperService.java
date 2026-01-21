package ru.itmo.is.lab1.service;

import org.springframework.stereotype.Service;
import ru.itmo.is.lab1.dto.*;
import ru.itmo.is.lab1.entity.*;

@Service
public class MapperService {

    public WorkerDTO toDTO(Worker worker) {
        if (worker == null) return null;
        
        WorkerDTO dto = new WorkerDTO();
        dto.setId(worker.getId());
        dto.setName(worker.getName());
        dto.setCoordinates(toDTO(worker.getCoordinates()));
        dto.setCreationDate(worker.getCreationDate());
        dto.setOrganization(toDTO(worker.getOrganization()));
        dto.setSalary(worker.getSalary());
        dto.setRating(worker.getRating());
        dto.setStartDate(worker.getStartDate());
        dto.setPosition(worker.getPosition());
        dto.setStatus(worker.getStatus());
        dto.setPerson(toDTO(worker.getPerson()));
        return dto;
    }

    public Worker toEntity(WorkerDTO dto) {
        if (dto == null) return null;
        
        Worker worker = new Worker();
        worker.setId(dto.getId());
        worker.setName(dto.getName());
        worker.setCoordinates(toEntity(dto.getCoordinates()));
        worker.setCreationDate(dto.getCreationDate());
        worker.setOrganization(toEntity(dto.getOrganization()));
        worker.setSalary(dto.getSalary());
        worker.setRating(dto.getRating());
        worker.setStartDate(dto.getStartDate());
        worker.setPosition(dto.getPosition());
        worker.setStatus(dto.getStatus());
        worker.setPerson(toEntity(dto.getPerson()));
        return worker;
    }

    public CoordinatesDTO toDTO(Coordinates coordinates) {
        if (coordinates == null) return null;
        
        CoordinatesDTO dto = new CoordinatesDTO();
        dto.setId(coordinates.getId());
        dto.setX(coordinates.getX());
        dto.setY(coordinates.getY());
        return dto;
    }

    public Coordinates toEntity(CoordinatesDTO dto) {
        if (dto == null) return null;
        
        Coordinates coordinates = new Coordinates();
        coordinates.setId(dto.getId());
        coordinates.setX(dto.getX());
        coordinates.setY(dto.getY());
        return coordinates;
    }

    public OrganizationDTO toDTO(Organization organization) {
        if (organization == null) return null;
        
        OrganizationDTO dto = new OrganizationDTO();
        dto.setId(organization.getId());
        dto.setOfficialAddress(toDTO(organization.getOfficialAddress()));
        dto.setAnnualTurnover(organization.getAnnualTurnover());
        dto.setEmployeesCount(organization.getEmployeesCount());
        dto.setRating(organization.getRating());
        dto.setType(organization.getType());
        dto.setPostalAddress(toDTO(organization.getPostalAddress()));
        return dto;
    }

    public Organization toEntity(OrganizationDTO dto) {
        if (dto == null) return null;
        
        Organization organization = new Organization();
        organization.setId(dto.getId());
        organization.setOfficialAddress(toEntity(dto.getOfficialAddress()));
        organization.setAnnualTurnover(dto.getAnnualTurnover());
        organization.setEmployeesCount(dto.getEmployeesCount());
        organization.setRating(dto.getRating());
        organization.setType(dto.getType());
        organization.setPostalAddress(toEntity(dto.getPostalAddress()));
        return organization;
    }

    public PersonDTO toDTO(Person person) {
        if (person == null) return null;
        
        PersonDTO dto = new PersonDTO();
        dto.setId(person.getId());
        dto.setEyeColor(person.getEyeColor());
        dto.setHairColor(person.getHairColor());
        dto.setLocation(toDTO(person.getLocation()));
        dto.setBirthday(person.getBirthday());
        dto.setHeight(person.getHeight());
        return dto;
    }

    public Person toEntity(PersonDTO dto) {
        if (dto == null) return null;
        
        Person person = new Person();
        person.setId(dto.getId());
        person.setEyeColor(dto.getEyeColor());
        person.setHairColor(dto.getHairColor());
        person.setLocation(toEntity(dto.getLocation()));
        person.setBirthday(dto.getBirthday());
        person.setHeight(dto.getHeight());
        return person;
    }

    public AddressDTO toDTO(Address address) {
        if (address == null) return null;
        
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setStreet(address.getStreet());
        dto.setZipCode(address.getZipCode());
        return dto;
    }

    public Address toEntity(AddressDTO dto) {
        if (dto == null) return null;
        
        Address address = new Address();
        address.setId(dto.getId());
        address.setStreet(dto.getStreet());
        address.setZipCode(dto.getZipCode());
        return address;
    }

    public LocationDTO toDTO(Location location) {
        if (location == null) return null;
        
        LocationDTO dto = new LocationDTO();
        dto.setId(location.getId());
        dto.setX(location.getX());
        dto.setY(location.getY());
        dto.setName(location.getName());
        return dto;
    }

    public Location toEntity(LocationDTO dto) {
        if (dto == null) return null;
        
        Location location = new Location();
        location.setId(dto.getId());
        location.setX(dto.getX());
        location.setY(dto.getY());
        location.setName(dto.getName());
        return location;
    }
}

