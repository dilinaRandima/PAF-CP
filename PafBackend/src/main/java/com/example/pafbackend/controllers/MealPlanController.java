package com.example.pafbackend.controllers;

import com.example.pafbackend.models.MealPlan;
import com.example.pafbackend.repositories.MealPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/MealPlans")
public class MealPlanController {

    private final MealPlanRepository MealPlanRepository;

    @Autowired
    public MealPlanController(MealPlanRepository MealPlanRepository) {
        this.MealPlanRepository = MealPlanRepository;
    }

    @GetMapping
    public ResponseEntity<List<MealPlan>> getMealPlans() {
        List<MealPlan> MealPlans = MealPlanRepository.findAll();
        return new ResponseEntity<>(MealPlans, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MealPlan>> getMealPlansByUserId(@PathVariable String userId) {
        List<MealPlan> MealPlans = MealPlanRepository.findByUserId(userId);
        return new ResponseEntity<>(MealPlans, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan MealPlan) {
        MealPlan savedMealPlan = MealPlanRepository.save(MealPlan);
        return new ResponseEntity<>(savedMealPlan, HttpStatus.CREATED);
    }

    @DeleteMapping("/{MealPlanId}")
    public ResponseEntity<Void> deleteMealPlan(@PathVariable String MealPlanId) {
        MealPlanRepository.deleteById(MealPlanId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @PutMapping("/{MealPlanId}")
    public ResponseEntity<MealPlan> updateMealPlan(@PathVariable String MealPlanId, @RequestBody MealPlan updatedMealPlan) {
        Optional<MealPlan> existingMealPlanOptional = MealPlanRepository.findById(MealPlanId);
        if (existingMealPlanOptional.isPresent()) {
            MealPlan existingMealPlan = existingMealPlanOptional.get();
            // Update the existing Learning Progress with the new details
            existingMealPlan.setUserId(updatedMealPlan.getUserId());
            existingMealPlan.setRoutines(updatedMealPlan.getRoutines());
            existingMealPlan.setPlanName(updatedMealPlan.getPlanName());
            existingMealPlan.setDescription(updatedMealPlan.getDescription());
            existingMealPlan.setGoal(updatedMealPlan.getGoal());

            // Save the updated Learning Progress
            MealPlan savedMealPlan = MealPlanRepository.save(existingMealPlan);
            return new ResponseEntity<>(savedMealPlan, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
