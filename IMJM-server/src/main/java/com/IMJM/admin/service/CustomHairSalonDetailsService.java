package com.IMJM.admin.service;

import com.IMJM.admin.dto.CustomHairSalonDetails;
import com.IMJM.common.entity.Salon;
import com.IMJM.admin.repository.HairSalonRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomHairSalonDetailsService implements UserDetailsService {

    private final HairSalonRepository hairSalonRepository;

    public CustomHairSalonDetailsService(HairSalonRepository hairSalonRepository) {
        this.hairSalonRepository = hairSalonRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Salon> hairSalonData = hairSalonRepository.findById(username);

        // Optional이 비어 있는지 확인
        if (hairSalonData.isPresent()) {
            Salon salon = hairSalonData.get();
            return new CustomHairSalonDetails(salon);
        }
        return null;
    }

}
