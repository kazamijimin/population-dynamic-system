import random
from django.utils import timezone
from core.common.models import SimulationSettings, Household, PopulationRecord, LifeEvent

def run_test():
    config = SimulationSettings.objects.first()
    if not config:
        config = SimulationSettings.objects.create(birth_rate=20.0) # Set high for testing
    
    households = Household.objects.all()
    print(f"--- SIMULATION TEST START ---")
    print(f"Birth Rate: {config.birth_rate}%")
    print(f"Target Households: {households.count()}")
    
    births = 0
    for house in households:
        # Simple probability check
        if random.random() < (config.birth_rate / 100):
            # Create the record
            baby = PopulationRecord.objects.create(
                first_name=f"TestBaby_{random.randint(100,999)}",
                last_name="Simulated",
                birth_date=timezone.now().date(),
                gender="Male",
                civil_status="Single",
                employment_status="Student",
                household=house,
                status="Active"
            )
            # Record the life event
            LifeEvent.objects.create(
                person=baby,
                event_type="Birth",
                event_date=timezone.now().date(),
                description="Automated Simulation Test Birth"
            )
            births += 1
            print(f"[SUCCESS] Birth recorded in Household: {house.house_number}")
            
    print(f"--- SIMULATION TEST COMPLETE ---")
    print(f"Total New Births: {births}")

if __name__ == "__main__":
    run_test()
