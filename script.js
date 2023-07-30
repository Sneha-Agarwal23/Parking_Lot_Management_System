class ParkingLot{

    constructor(noOfFloors, slotsPerFloor){
        this.floors = [];
        for(let floorNo = 1; floorNo <= noOfFloors; floorNo++){
            const floor = new Floor(floorNo);
            for(let slotNo = 1; slotNo <= slotsPerFloor; slotNo++){
                let slotType;
                if(slotNo <= 10){
                    slotType = 'TwoWheeler';
                }else {
                    slotType = 'FourWheeler';
                }
                floor.addSlot(slotType);
            } 
            this.floors.push(floor);
        }
        this.fareCalculator = new FareCalculator();
    }

    parkVehicle(vehicleType, vehicleName, licenseNo){
        const slot  = this.findAvailableSlot(vehicleType);
        if(!slot){
            return 'No Parking Space Available';
        }
        slot.parkVehicle(new Vehicle(vehicleType, vehicleName, licenseNo));
        const entryTime = slot.getEntryTime();
        const ticket = `${vehicleName}_${licenseNo}_${slot.getFloorNumber()}_${slot.getSlotNumber()}`;
        return `Parked Vehicle with Ticket ID : ${ticket} \nEntry Time: ${entryTime}`; 
    }

    findAvailableSlot(vehicleType){
        for(const floor of this.floors){
            for(const slot of floor.getSlots()){
                if(slot.getSlotType() === vehicleType && slot.isAvailable()){
                    return slot;
                }
            }
        }
        return null;
    }
    
    unparkVehicle(ticket){
        const parts = ticket.split("_");
        const floorNumber = parseInt(parts[2]);
        const slotNumber = parseInt(parts[3]);

        if(floorNumber <= this.floors.length && slotNumber <= this.floors[floorNumber-1].getSlots().length){
        const slot = this.floors[floorNumber-1].getSlots()[slotNumber-1];
        if(!slot.isAvailable()){
            const vehicle = slot.getVehicle();
            const entryTime = slot.getEntryTime();
            const duration = slot.unparkVehicle();
            const exitTime = slot.getExitTime();
            const fare = this.fareCalculator.calculateFare(vehicle, duration);
            return `Unparked the Vehicle with License No : ${vehicle.getLicenseNo()} \nEntry Time: ${entryTime} \nExit Time: ${exitTime} \nFare: ${fare}`;
        }
        }
        return 'Invalid Ticket';
    }

    infoOfFreeSlots(vehicleType){
        const freeSlot = [];
        for(const floor of this.floors){
            const slots = [];
            for(const slot of floor.getSlots()){
                if(slot.getSlotType() === vehicleType && slot.isAvailable()){
                    slots.push(slot.getSlotNumber());
                }
            }
            freeSlot.push(slots.join(" , "));
        }
        return freeSlot;
    }

    infoOfOccupiedSlots(){
        const occupiedSlot = [];

        for(const floor of this.floors){
            const slots = [];
            for(const slot of floor.getSlots()){
                if(!slot.isAvailable()){
                    const vehicle = slot.getVehicle();
                    slots.push(`Slot No : ${slot.getSlotNumber()} Vehicle Type : ${vehicle.getVehicleType()}\n License No : ${vehicle.getLicenseNo()} Vehicle Name : ${vehicle.getVehicleName()}`);
                }
            }
            if(slots.length > 0){
                occupiedSlot.push(`Floor No : ${floor.getFloorNo()} ${slots.join("\n")}`);
            }
        }
        return occupiedSlot;
    }
}

class Floor{
    constructor(floorNo){
        this.floorNo = floorNo;
        this.slots = [];
    }

    getFloorNo(){
        return this.floorNo;
    }

    getSlots(){
        return this.slots;
    }

    addSlot(slotType){
        this.slots.push(new Slot(slotType, this.slots.length+1, this.floorNo));
    }
}

class Slot{
    constructor(slotType, slotNumber, floorNumber){
        this.slotType = slotType;
        this.available = true;
        this.slotNumber = slotNumber;
        this.floorNumber = floorNumber;
        this.vehicle = null;
        this.entryTime = null;
        this.exitTime = null;
    }

    getSlotType(){
        return this.slotType;
    }

    isAvailable(){
        return this.available;
    }

    getSlotNumber(){
        return this.slotNumber;
    }

    getFloorNumber(){
        return this.floorNumber;
    }

    getVehicle(){
        return this.vehicle;
    }

    parkVehicle(vehicle){
        this.vehicle = vehicle;
        this.available = false;
        this.entryTime = new Date();
        
    }

    unparkVehicle(){
        this.vehicle = null;
        this.available = true;
        this.exitTime = new Date();
        return this.getDurationInMinutes(this.entryTime, this.exitTime);
    }

    getDurationInMinutes(startTime, endTime) {
        if (startTime && endTime) {
          const durationInMilliseconds = endTime - startTime;
          return Math.floor(durationInMilliseconds / 60000); // Convert to minutes
        }
        return 0;
    }

    getEntryTime() {
        return this.entryTime;
    }
  
    getExitTime(){
        return this.exitTime;
    }
}


class Vehicle{
    constructor(vehicleType, vehicleName, licenseNo){
        this.vehicleType = vehicleType;
        this.licenseNo = licenseNo;
        this.vehicleName = vehicleName;
    }

    getVehicleType(){
        return this.vehicleType;
    }

    getVehicleName(){
        return this.vehicleName;
    }

    getLicenseNo(){
        return this.licenseNo;
    }

}

class FareCalculator {
    constructor() {
      this.hourlyRate = 100; 
      this.additionalRate = 50; 
    }
  
    calculateFare(vehicle, duration) {
      const hoursParked = Math.ceil((duration) / 60);
  
      if (hoursParked <= 1) {
        return this.hourlyRate;
      } else {
        return this.hourlyRate + this.additionalRate * (hoursParked - 1);
      }
    }
}


const obj = new ParkingLot(3, 20);

function parkVehicle(){
    const vehicleType = document.getElementById('vehicleType').value;
    const vehicleName = document.getElementById('vehicleName').value;
    const licenseNo = document.getElementById('licenseNo').value;

    if (vehicleType === '' || licenseNo === '' || vehicleName === '') {
        alert('Please fill in all fields before parking the vehicle.');
        return;
      }

    const licenseNoPattern = /^[a-zA-Z0-9]+$/;
    if (!licenseNoPattern.test(licenseNo)) {
      alert('Please enter a valid license number (only alphanumeric characters are allowed).');
      return;
    }

    const vehicleNamePattern = /^[A-Za-z]+$/;
    if (!vehicleNamePattern.test(vehicleName)) {
      alert('Please enter a valid vehicle name.');
      return;
    }

    
    const result = obj.parkVehicle(vehicleType, vehicleName, licenseNo);
    document.getElementById('result').innerText = result;
}

function unparkVehicle(){
    const ticket = document.getElementById('ticketId').value;

    const ticketIdPattern = /^[a-zA-Z0-9]+_[a-zA-Z0-9]+_\d+_\d+$/;
    if (!ticketIdPattern.test(ticket)) {
        alert('Please enter a valid ticket ID (e.g., dvaz_vdsb_1_5).');
        return;
      }
  
      if (ticket === '') {
        alert('Please enter a valid ticket ID before unparking the vehicle.');
        return;
      }

    const result = obj.unparkVehicle(ticket);
    document.getElementById('result').innerText = result;
}

function showAllFreeSlots() {
    const vehicleType = document.getElementById('vehicleType').value;
    const freeSlots = obj.infoOfFreeSlots(vehicleType);

    let result = "Free slots for " + vehicleType + ":\n";

    freeSlots.forEach((slots, index) => {
        result += "Floor " + (index + 1) + ": " + slots + "\n";
      });

    document.getElementById('result').innerText = result;
}

function showOccupiedSlots() {
    const occupiedSlots = obj.infoOfOccupiedSlots();
    let result = "Occupied slots :\n";
    occupiedSlots.forEach((slots) => {
      result += slots + "\n";
    });
  
    document.getElementById('result').innerText = result;
  }
